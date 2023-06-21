import axios from 'axios';
import dayjs from 'dayjs';
import fs from 'fs';
import { camelCase, flattenDeep, uniq } from 'lodash';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import * as pdfjs from 'pdfjs-dist';
import { Model, Op, WhereOptions } from 'sequelize';
import XLSX from 'xlsx';

import { CursorPayload, OrderConfig, PaginationConnection, PaginationParams, PaginationQuery } from './types';
import env from '../../../../config/env';

export const parseCursor = (cursor: string): CursorPayload | null => {
  if (!cursor) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch (e) {
    return null;
  }
};

export const getPrimaryKeyFields = (model: any): string[] => {
  const primaryKeyFields = Object.entries(model.rawAttributes)
    .filter(([, attribute]: any) => attribute.primaryKey)
    .map(([column]) => column);

  return primaryKeyFields;
};

const normalizePrimaryKeyField = (primaryKeyField: string | string[]): string[] =>
  Array.isArray(primaryKeyField) ? primaryKeyField : [primaryKeyField];

const ensurePrimaryKeyFieldInOrder = (order: OrderConfig, primaryKeyField: string[]): OrderConfig => {
  const missingPrimaryKeyFields = primaryKeyField.filter((pkField) => !order.find(([field]) => field === pkField));

  const primaryKeyOrder: OrderConfig = missingPrimaryKeyFields.map((field) => [field, 'DESC']);

  return [...order, ...primaryKeyOrder];
};

export const normalizeOrder = (order: any, primaryKeyField: string | string[], omitPrimaryKeyFromOrder: boolean): OrderConfig => {
  const normalizedPrimaryKeyField = normalizePrimaryKeyField(primaryKeyField);

  let normalized: any[] = [];

  if (Array.isArray(order)) {
    normalized = order.map((o) => {
      if (typeof o === 'string') {
        return [o, 'ASC'];
      }

      if (Array.isArray(o)) {
        const [field, direction] = o;

        return [field, direction || 'ASC'];
      }

      return o;
    });
  }

  return omitPrimaryKeyFromOrder ? normalized : ensurePrimaryKeyFieldInOrder(normalized, normalizedPrimaryKeyField);
};

export const reverseOrder = (order: OrderConfig): OrderConfig =>
  order.map(([field, direction]) => [field, direction.toLowerCase() === 'desc' ? 'ASC' : 'DESC']);

const serializeCursor = (payload: CursorPayload): string => Buffer.from(JSON.stringify(payload)).toString('base64');

export const createCursor = <ModelType extends Model>(instance: ModelType, order: OrderConfig): string => {
  const payload = order.map(([field]) => instance.get(camelCase(field)));

  return serializeCursor(payload);
};

const isValidCursor = (cursor: CursorPayload, order: OrderConfig): boolean => cursor.length === order.length;

const recursivelyGetPaginationQuery = (order: OrderConfig, cursor: CursorPayload): WhereOptions<any> => {
  const currentOp = order[0][1].toLowerCase() === 'desc' ? Op.lt : Op.gt;

  if (order.length === 1) {
    return {
      [order[0][0]]: {
        [currentOp]: cursor[0],
      },
    };
  }
  return {
    [Op.or]: [
      {
        [order[0][0]]: {
          [currentOp]: cursor[0],
        },
      },
      {
        [order[0][0]]: cursor[0],
        ...recursivelyGetPaginationQuery(order.slice(1), cursor.slice(1)),
      },
    ],
  };
};

export const getPaginationQuery = (order: OrderConfig, cursor: CursorPayload): WhereOptions<any> | null => {
  if (!isValidCursor(cursor, order)) {
    return null;
  }

  return recursivelyGetPaginationQuery(order, cursor);
};

export const getPaginateOptions = (paginationParams: PaginationParams) => {
  const paginateOptions: PaginationQuery = { limit: 40, order: [['created_at', 'DESC']] };

  // Limit options
  if (paginationParams.limit) paginateOptions.limit = paginationParams.limit;

  // Fetch the first limit list after the last result of response
  if (paginationParams.after) paginateOptions.after = paginationParams.after;

  // Fetch the last limit list after the first result of response
  if (paginationParams.before) paginateOptions.before = paginationParams.before;

  // Order
  if (paginationParams.sortBy && paginationParams.sortDirection) {
    paginateOptions.order = [[paginationParams.sortBy, paginationParams.sortDirection]];
  }

  if (paginationParams.order) {
    paginateOptions.order = paginationParams.order;
  }

  return paginateOptions;
};

export const paginationSerializer = <ModelType extends Model>(data: PaginationConnection<ModelType>, serializer: Function) => {
  data.list = data.list.map((instance) => ({
    item: serializer(instance.item),
    cursor: instance.cursor,
  }));
  return data;
};

// Extract Pdf to Immunization
export const getContentPdf = async (url: string) => {
  const doc = await pdfjs.getDocument(url).promise;
  const numberPages = doc.numPages;
  const contents = await Promise.all([
    ...Array.from(Array(numberPages).keys()).map(async (number) => {
      const page = await doc.getPage(number + 1);
      return page.getTextContent();
    }),
  ]);
  return contents.map((content: any, _: number) => {
    const items = content.items.sort((a: any, b: any) => a.transform[5] - b.transform[5]);
    return {
      items: items.map((item: any) => ({
        str: item.str,
        transform: [item.transform[4], item.transform[5]],
      })),
    };
  });
};

export const extractImmunizationFromPDF = async (url: string) => {
  try {
    const contentPdf = await getContentPdf(url);

    for (const page in contentPdf) {
      if (page) {
        const { items } = contentPdf[page];

        const yArr = uniq(items.map((item) => item.transform[1]));
        const lines = yArr.map((y) => ({
          str: items
            .filter((item) => item.transform[1] === y)
            .map((item) => item.str.toLowerCase())
            .join(),
          y,
        }));
        const headerTable = lines.find(
          (line) =>
            (line.str.includes('schedule') || line.str.includes('date due') || line.str.includes('due ')) &&
            (line.str.includes('date given') || line.str.includes('date done')) &&
            (line.str.includes('antigen') ||
              line.str.includes('immunisation') ||
              line.str.includes('immunization') ||
              line.str.includes('vaccine') ||
              line.str.includes('shot'))
        );
        if (headerTable) {
          const cols = items.filter((item) => item.transform[1] === headerTable.y);

          const schedule = cols.find((col) => ['schedule', 'due date', 'due'].includes(col.str.toLowerCase()));
          const dateGiven = cols.find((col) => ['date given', 'date done'].includes(col.str.toLowerCase()));
          const immunization = cols.find((col) =>
            ['antigen', 'immunisation', 'immunization', 'vaccine', 'shot'].includes(col.str.toLowerCase())
          );
          const batchNo = cols.find((col) => ['batch no', 'batch no.'].includes(col.str.toLowerCase()));
          const organization = cols.find((col) =>
            ['organization', 'site', 'location', 'hospital', 'clinic', 'brand'].includes(col.str.toLowerCase())
          );

          const scheduleCol = schedule
            ? items.filter(
                (item) =>
                  item.transform[1] < schedule?.transform[1] &&
                  item.transform[0] === schedule?.transform[0] &&
                  (item.str.toLowerCase().includes('month') ||
                    item.str.toLowerCase().includes('year') ||
                    item.str.toLowerCase().includes('other') ||
                    item.str.toLowerCase().includes('birth'))
              )
            : [];

          const dateGivenCol = dateGiven
            ? items.filter(
                (item) =>
                  item.transform[1] < dateGiven?.transform[1] && item.transform[0] === dateGiven?.transform[0] && dayjs(item.str).isValid()
              )
            : [];

          const immunizationCol = immunization
            ? items.filter((item) => item.transform[1] < immunization?.transform[1] && item.transform[0] === immunization?.transform[0])
            : [];

          const batchNoCol = batchNo
            ? items.filter((item) => item.transform[1] < batchNo?.transform[1] && item.transform[0] === batchNo?.transform[0])
            : [];

          const organizationCol = organization
            ? items.filter((item) => item.transform[1] < organization?.transform[1] && item.transform[0] === organization?.transform[0])
            : [];

          const vaccinations = scheduleCol.map((_, index: number) => {
            const dateGivens =
              index === 0
                ? [...dateGivenCol.filter((dateGiven) => dateGiven.transform[1] <= scheduleCol[index].transform[1] + 1)]
                : [
                    ...dateGivenCol.filter(
                      (dateGiven) =>
                        dateGiven.transform[1] <= scheduleCol[index].transform[1] + 1 &&
                        dateGiven.transform[1] > scheduleCol[index - 1].transform[1] + 1
                    ),
                  ];
            const immunization =
              index === 0
                ? [...immunizationCol.filter((immunization) => immunization.transform[1] <= scheduleCol[index].transform[1] + 1)]
                : [
                    ...immunizationCol.filter(
                      (immunization) =>
                        immunization.transform[1] <= scheduleCol[index].transform[1] + 1 &&
                        immunization.transform[1] > scheduleCol[index - 1].transform[1] + 1
                    ),
                  ];

            const batchNo =
              index === 0
                ? [...batchNoCol.filter((batchNo) => batchNo.transform[1] <= scheduleCol[index].transform[1] + 1).map((item) => item.str)]
                : [
                    ...batchNoCol
                      .filter(
                        (batchNo) =>
                          batchNo.transform[1] <= scheduleCol[index].transform[1] + 1 &&
                          batchNo.transform[1] > scheduleCol[index - 1].transform[1] + 1
                      )
                      .map((item) => item.str),
                  ];

            const organization =
              index === 0
                ? [
                    ...organizationCol
                      .filter((organization) => organization.transform[1] <= scheduleCol[index].transform[1] + 1)
                      .map((item) => item.str),
                  ]
                : [
                    ...organizationCol
                      .filter(
                        (organization) =>
                          organization.transform[1] <= scheduleCol[index].transform[1] + 1 &&
                          organization.transform[1] > scheduleCol[index - 1].transform[1] + 1
                      )
                      .map((item) => item.str),
                  ];
            return {
              schedule: scheduleCol[index].str.toLowerCase() !== 'birth' ? scheduleCol[index].str : '0 month',
              dateGivens,
              immunization,
              batchNo,
              organization,
            };
          });

          const vaccinationRecords = [];

          vaccinations.forEach((vaccination) => {
            if (vaccination.immunization.length >= 2) {
              if (vaccination.dateGivens.length <= 1) {
                vaccinationRecords.push(
                  ...vaccination.immunization.map((item) => ({
                    dateGiven: vaccination.dateGivens.length ? vaccination.dateGivens[0].str : null,
                    immunization: item.str,
                    schedule: vaccination.schedule,
                    batchNo: vaccination.batchNo,
                    organization: vaccination.organization,
                  }))
                );
              }
              if (vaccination.dateGivens.length >= 2) {
                vaccinationRecords.push(
                  ...vaccination.immunization.map((item) => ({
                    dateGiven: vaccination.dateGivens.filter((date) => date.transform[1] >= item.transform[1]).length
                      ? vaccination.dateGivens.filter((date) => date.transform[1] >= item.transform[1])[0].str
                      : null,
                    immunization: item.str,
                    schedule: vaccination.schedule,
                    batchNo: vaccination.batchNo,
                    organization: vaccination.organization,
                  }))
                );
              }
            } else {
              vaccinationRecords.push({
                schedule: vaccination.schedule,
                batchNo: vaccination.batchNo,
                organization: vaccination.organization,
                immunization: vaccination.immunization[0].str,
                dateGiven: vaccination.dateGivens[0].str,
              });
            }
          });

          // Extract data successfully
          if (vaccinationRecords.length) {
            return (
              vaccinationRecords
                .filter((record) => record.schedule.toLowerCase() !== 'other')
                .map((record) => {
                  const monthOld =
                    record.schedule.split(' ')[1] === 'months'
                      ? Number.parseInt(record.schedule.split(' ')[0], 10)
                      : Number.parseInt(record.schedule.split(' ')[0], 10) * 12;
                  return {
                    monthOld,
                    dateGiven: record.dateGiven,
                    antigen: record.immunization,
                    batchNo: record.batchNo.length ? record.batchNo[0] : '',
                    organization: record.organization.length ? record.organization[0] : '',
                  };
                }) || []
            );
          }
        }
      }
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const filterImmunizationRecords = (immunizationInput: any[], immunizationData: any[]) => {
  try {
    const filterRecords: any = [];
    immunizationInput.forEach((immunization: any) => {
      const matchRecord = immunizationData.find(
        (item: any) => item.monthOld === immunization.monthOld && item.antigen[0].name === immunization.antigen
      );
      if (matchRecord) {
        filterRecords.push({ id: matchRecord.recordId, ...immunization });
      }
    });
    return filterRecords;
  } catch (e) {
    return [];
  }
};

export const imageToText = async (fileBase64: string) => {
  try {
    const { data } = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${env.cloudVisionApiKey}`, {
      requests: [
        {
          image: {
            content: fileBase64,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    });
    return data.responses[0].fullTextAnnotation.text;
  } catch (error) {
    return null;
  }
};

export const readContentFile = async (file: any) => {
  try {
    const fileExtension = file.originalname.split('.')[file.originalname.split('.').length - 1];
    switch (fileExtension) {
      case 'docx':
      case 'doc': {
        const data = await mammoth.extractRawText({ path: file.path });
        return data.value;
      }
      case 'xlsx':
      case 'xls': {
        const workbook = XLSX.readFile(file.path);

        const worksheets: { [key: string]: any[] } = {};
        for (const sheetName of workbook.SheetNames) {
          worksheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        }

        let result = '';
        for (const sheet of Object.keys(worksheets)) {
          for (const item of flattenDeep(worksheets[sheet])) {
            if (item || item === 0) result += `${item}     `;
          }
        }

        return result;
      }
      case 'txt': {
        const data = fs.readFileSync(file.path, { encoding: 'utf8' });
        return data;
      }
      case 'pdf': {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdf(dataBuffer);
        return data.text;
      }
      case 'png':
      case 'jpg':
      case 'jpeg': {
        const fileBase64 = fs.readFileSync(file.path, { encoding: 'base64' });
        return imageToText(fileBase64);
      }

      default:
        return null;
    }
  } catch (e) {
    return null;
  }
};

const MAILJET_API_URL = `https://${env.mjApiKeyPublic}:${env.mjApiKeyPrivate}@api.mailjet.com`;

export const getTemplate = async (templateId?: string) => {
  try {
    if (templateId) {
      const { data } = await axios.get(`${MAILJET_API_URL}/v3/REST/template/${templateId}/detailcontent`);
      return { content: data.Data[0]['Html-part'] };
    }
    const { data } = await axios.get(`${MAILJET_API_URL}/v3/REST/template`);
    return [
      ...data.Data.map((template) => ({
        name: template.Name,
        templateId: template.ID,
        createdAt: template.CreatedAt,
        lastUpdatedAt: template.LastUpdatedAt,
      })),
    ];
  } catch (e) {
    return null;
  }
};

export const sendNewsletterMailjet = async (templateId: string, recipients: { id: string | null; email: string }[]) => {
  try {
    const { data } = await axios.get(`${MAILJET_API_URL}/v3/REST/sender`);
    const senders = data.Data;
    if (senders && senders.length) {
      const { data: contentTemplate } = await axios.get(`${MAILJET_API_URL}/v3/REST/template/${templateId}/detailcontent`);
      const data = await Promise.all([
        ...recipients.map((recipient) =>
          axios.post(`${MAILJET_API_URL}/v3.1/send`, {
            Messages: [
              {
                From: {
                  Email: senders[0].Email,
                  Name: 'ZestHealth Kids',
                },
                To: [{ Email: recipient.email.trim(), Name: 'Subscriber' }],
                Subject: 'ZestHealth Kids Newsletter',
                TextPart: `${contentTemplate.Data[0]['Text-part']}`.replace(/\[\[UNSUB_LINK_EN\]\]/g, '[[var:UNSUB_LINK_EN]]'),
                HTMLPart: `${contentTemplate.Data[0]['Html-part']}`.replace(/\[\[UNSUB_LINK_EN\]\]/g, '[[var:UNSUB_LINK_EN]]'),
                TemplateLanguage: true,
              },
            ],
            Globals: {
              Variables: {
                UNSUB_LINK_EN: recipient.id ? `${env.clientUrl}/unsubscribe/${recipient.id}` : env.clientUrl,
              },
            },
          })
        ),
      ]);
      const isSuccess = data && !data.map((item) => item.status).filter((item) => item !== 200).length;
      return isSuccess;
    }
    return false;
  } catch (error) {
    return false;
  }
};
