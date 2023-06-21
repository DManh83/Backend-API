export const parseFormData = (formData: { [key: string]: any }, keys: string[]) => {
  const parsedData = { ...formData };
  keys.forEach((key) => {
    if (formData[key]) {
      parsedData[key] = JSON.parse(formData[key]);
    }
  });
  return parsedData;
};
