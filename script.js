let imageData;

function analyze() {
  const input = document.getElementById("imageInput");
  if (!input.files.length) return alert("Upload image");

  const img = new Image();
  img.onload = () => processImage(img);
  img.src = URL.createObjectURL(input.files[0]);
}

function processImage(img) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // sample center face region
  const x = img.width * 0.4;
  const y = img.height * 0.3;
  const w = img.width * 0.2;
  const h = img.height * 0.2;

  const data = ctx.getImageData(x, y, w, h).data;
  imageData = data;

  let r=0,g=0,b=0;
  for (let i=0;i<data.length;i+=4) {
    r+=data[i]; g+=data[i+1]; b+=data[i+2];
  }
  r/=data.length/4; g/=data.length/4; b/=data.length/4;

  const undertone = detectUndertone(r,g,b);
  const contrast = detectContrast(r,g,b);
  const season = mapSeason(undertone, contrast);

  document.getElementById("result").innerHTML = `
    <h2>Result</h2>
    <p><b>Undertone:</b> ${undertone}</p>
    <p><b>Contrast:</b> ${contrast}</p>
    <p><b>Season Family:</b> ${season}</p>
  `;

  document.getElementById("payment").classList.remove("hidden");
}

function detectUndertone(r,g,b) {
  if (r > g && r > b) return "Warm";
  if (b > r) return "Cool";
  return "Neutral";
}

function detectContrast(r,g,b) {
  const brightness = (r+g+b)/3;
  return brightness > 150 ? "Light / Bright" : "Deep / Soft";
}

function mapSeason(undertone, contrast) {
  if (undertone === "Warm" && contrast.includes("Light")) return "Light Spring";
  if (undertone === "Warm") return "Deep Autumn";
  if (undertone === "Cool" && contrast.includes("Light")) return "Light Summer";
  return "Deep Winter";
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.addImage("logo.png", "PNG", 70, 10, 60, 30);
  pdf.text("Haneul Palette – Personal Report", 20, 50);
  pdf.text(document.getElementById("result").innerText, 20, 70);

  pdf.save("haneul-palette-report.pdf");
}
