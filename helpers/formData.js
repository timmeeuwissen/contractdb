export const multipartToObject = async (event) => {
  const parts = await readMultipartFormData(event);
  
  return parts.reduce((acc, rec) => {
    if('filename' in rec) {
      acc.files[rec.name] = rec
    }
    else {
      acc.props[rec.name] = rec.data.toString()
    }
    return acc
  }, {files: {}, props: {}});
}