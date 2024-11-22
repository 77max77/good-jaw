export const distanceTwoPoints = (startX, startY, endX, endY) => {
  const x = endX - startX;
  const y = endY - startY;

  return Math.sqrt(x * x + y * y);
}

export const distanceWidth = (startX, endX) => {
  return Math.abs(endX - startX);
}

// baseCM:basePX  = distanceCM:distancePX // distanceCM = baseCM * distancePX / basePX
export const pxtocm = (baseCM, basePX, distancePX) => {
  return (baseCM * distancePX) / basePX;
}