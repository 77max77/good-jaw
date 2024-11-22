export const saveAnalysisData = async (data) => {
  const response = await fetch("http://localhost:8080/api/report/runTrial/analysis/save.do", {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=UTF-8" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to save analysis data");
  return response.json();
};

export const fetchAnalysisResult = async (id) => {
  const response = await fetch(`http://localhost:8080/api/report/runTrial/analysis/result/${id}.do`);
  if (!response.ok) throw new Error("Failed to fetch analysis result");
  return response.json();
};
