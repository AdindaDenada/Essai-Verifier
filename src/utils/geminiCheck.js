export async function checkEssayWithGemini(fileUrl) {
  const API_KEY = "AIzaSyChdxuuujYmmC4AfDTaSkOCrXYiwEAlpL4";

  const prompt = `
Bacalah isi file esai ini: ${fileUrl}.

1. Ekstrak teksnya.
2. Periksa apakah ada indikasi plagiarisme.
3. Jelaskan persentase kemiripan (estimasi).
4. Beri penilaian: "Plagiat", "Berpotensi Plagiat", atau "Aman".
Berikan hasil dalam format JSON:
{
  "plagiarism": "%",
  "status": "",
  "summary": ""
}
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}
