import { Response } from 'express';
import { Parser } from 'json2csv';

const exportCsv = (res: Response, fileName: string, fields: { label: string; value: string }[], data) => {
  const json2csv = new Parser({ fields });
  const csv = json2csv.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment(fileName);
  return res.send(csv);
};
export default exportCsv;
