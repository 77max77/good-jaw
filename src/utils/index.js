import * as XLSX from 'xlsx';

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

export const excelExport = ({ jsonData,maxXY }) => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const worksheetMax = XLSX.utils.json_to_sheet(maxXY);
      XLSX.utils.book_append_sheet(workbook, worksheet, "RawData");
      XLSX.utils.book_append_sheet(workbook, worksheetMax, "MaxXY");
      XLSX.writeFile(workbook, "data.xlsx", { compression: true });
};



  
  // 그래프 옵션 생성 함수
  export const generateGraphOptions = (title, closeToOpenData,openToCloseData) => {
    const allData = [...closeToOpenData, ...openToCloseData];
  
  // x, y 값의 최소/최대값 계산
  const xValues = allData.map(point => point[0]);
  const yValues = allData.map(point => point[1]);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  // 여백을 위해 범위를 약간 확장
  const xPadding = (maxX - minX) * 0.1;
  const yPadding = (maxY - minY) * 0.1;

  return {
    title: { 
      text: title,
      left: "center",
      textStyle: {
        fontSize: 15
      },
      padding: [20, 0, 5, 0] 
    },
    xAxis: {
      min: minX - xPadding,
      max: maxX + xPadding,
      axisTick: {
        show: false,
      }
    },
    yAxis: {
      min: minY - yPadding,
      max: maxY + yPadding,
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false
      }
    },
    series: [
      {
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#18A8F1',
          width: 3,
          shadowColor: "rgba(0,0,0,0.3)",
          shadowBlur: 10,
          shadowOffsetY: 8,
        },
        data: closeToOpenData
      }, 
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#F36969',
          width: 3,
          shadowColor: "rgba(0,0,0,0.3)",
          shadowBlur: 10,
          shadowOffsetY: 8,
        },
        data: openToCloseData
      },
    ],
  };
};