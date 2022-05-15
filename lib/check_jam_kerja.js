function checkJamKerja() {
  return new Date().getHours() >= 17
    ? new Date().getMinutes() <= 0
    : new Date().getHours() >= 9;
}

export default checkJamKerja;
