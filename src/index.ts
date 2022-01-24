import puppeteer from "puppeteer";
import katex from "katex";
import express from "express";

console.log();

const app = express();
function getJsonFromUrl(url: string) {
  var query = url.substring(2);
  var result: any = {};
  query.split("&").forEach(function (part) {
    var item = [
      part.substring(0, part.indexOf("=")),
      part.substring(part.indexOf("=") + 1),
    ];
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
app.get("/", async (req, res) => {
  const eq = getJsonFromUrl(req.originalUrl).eq as string;

  const str = katex.renderToString(eq, {
    throwOnError: false,
  });
  var j = "";
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--incognito", "--no-sandbox", "--single-process", "--no-zygote"],
  });
  const page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    j = dialog.message();
    await dialog.dismiss();
  });
  await page.setContent(`
    <!DOCTYPE html>
    <!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
    <html>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">
    
        <!-- To automatically render math in text elements, include the auto-render extension: -->
        <script src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous"
            onload="renderMathInElement(document.body);"></script>
        <style>
            .katex { font-size: 3em; }
        </style>
      </head>
      <body>
            <div id="eq">
            ${str}
            </div>
            <script>
                const g = document.getElementById('eq')
                alert(g.offsetHeight+"x"+g.offsetWidth)
            </script>
      </body>
    </html>
    `);
  console.log(j);

  await page.screenshot({
    path: "example.png",
    clip: {
      width: parseInt(j.split("x")[1]),
      height: parseInt(j.split("x")[0]) + 12,
      x: 0,
      y: 0,
    },
  });

  await browser.close();

  res.sendFile(__dirname.split("/").slice(0, 3).join("/") + "/example.png");
});

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   const res = katex.renderToString("c = \\sqrt{a^2 + b^2}", {
//     throwOnError: false,
//   });
//   await page.setContent(`
//     <!DOCTYPE html>
//     <!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
//     <html>
//       <head>
//         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css" integrity="sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ" crossorigin="anonymous">

//         <!-- To automatically render math in text elements, include the auto-render extension: -->
//         <script src="https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/contrib/auto-render.min.js" integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR" crossorigin="anonymous"
//             onload="renderMathInElement(document.body);"></script>
//       </head>
//       <body>
//             ${res}
//       </body>
//     </html>
//     `);
//   await page.screenshot({ path: "example.png" });

//   await browser.close();
// })();

app.listen(8080, () => {
  console.log("Ready");
});
