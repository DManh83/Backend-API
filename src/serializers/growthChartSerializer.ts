import { get } from 'lodash';
import { AgePeriodAttributes, GrowthPointAttributes } from '../interfaces/GrowthChart';

export const agePeriodSerializer = (period: AgePeriodAttributes) => ({
  id: period.id,
  text: period.text,
  minAgeMonth: period.minAgeMonth,
  maxAgeMonth: period.maxAgeMonth,
});

export const growthPointSerializer = (point: GrowthPointAttributes) => ({
  id: point.id,
  babyBookId: point.babyBookId,
  date: point.date,
  headCircumference: point.headCircumference,
  weight: point.weight,
  height: point.height,
  isDeleted: point.isDeleted,
  isPercentile: point.isPercentile,
  level: point.level,
  sex: point.sex,
  ageMonth: point.ageMonth,
  color: point.color,
  versionYear: point.versionYear,
  isReleased: point.isReleased,
});

export const multipleGrowthPointSerializer = (points: GrowthPointAttributes[]) => {
  if (points[0]?.isPercentile) {
    return points.reduce((percentileData, point) => {
      if (get(percentileData, point.level)) {
        percentileData[point.level].push(growthPointSerializer(point));
      } else {
        percentileData[point.level] = [growthPointSerializer(point)];
      }
      return percentileData;
    }, {});
  }
  return points.map(growthPointSerializer);
};
