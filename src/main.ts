import "./style.css";

import Zip from "jszip";

const input = document.querySelector('input[type="file"]') as HTMLInputElement;
const download = document.getElementById("download") as HTMLButtonElement;
const downloadZip = document.getElementById(
  "download-zip"
) as HTMLButtonElement;
const svgWrapper = document.getElementById("svg-wrapper")!;

const zip = new Zip();

const folder = zip.folder("images");

input.addEventListener("change", function () {
  const files = this.files!;

  Array.from({ length: files.length }).forEach((_, i) => {
    const reader = new FileReader();
    let name = "";
    reader.onload = () => {
      const container = document.createElement("div");
      container.id = `container-${i}`;
      container.innerHTML = reader.result as string;
      svgWrapper.appendChild(container);

      const svgElement = container.querySelector("svg")!;
      const clonedNode = svgElement.cloneNode(true);
      const outerHtml = (clonedNode as any).outerHTML;
      const blob = new Blob([outerHtml], {
        type: "image/svg+xml;charset=utf-8",
      });
      const blobUrl = URL.createObjectURL(blob);
      const image = new Image(256, 256);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext("2d");
        context?.drawImage(image, 0, 0, 256, 256);

        const png = canvas.toDataURL();

        console.debug(i);
        folder?.file(`${name}.png`, getBase64String(png), {
          base64: true,
        });
        if (i === files.length - 1) {
          zip.generateAsync({ type: "blob" }).then((content) => {
            const contentUrl = URL.createObjectURL(content);
            const name = "image.zip";
            const link = document.createElement("a");
            link.download = name;
            link.style.opacity = "0";
            document.body.append(link);
            link.href = contentUrl;
            link.click();
            link.remove();
          });
        }
      };
      image.src = blobUrl;
    };
    const file = files.item(i)!;
    const names = file.name.split(".");
    names.pop();
    name = names.join(".");
    reader.readAsText(file);
  });
});

function getBase64String(dataURL: string) {
  var idx = dataURL.indexOf("base64,") + "base64,".length;
  return dataURL.substring(idx);
}
