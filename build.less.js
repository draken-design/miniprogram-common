import less from "less";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __Path = path.join("build.less.js");
const __dirname = fileURLToPath(import.meta.url).replace(__Path, "");
const buildCssPath = path.join(__dirname, "styles");
const lessAssetsPath = [path.join(__dirname, "less")];
const isPro = process.argv[2] === "build";
const buildCss = (cssContent, outputPath) => {
  return new Promise((resolve, reject) => {
    less
      .render(cssContent, {
        paths: lessAssetsPath,
        compress: isPro,
      })
      .then((res) => {
        if (res.css) {
          fs.writeFile(outputPath, res.css, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
let str = "";
const findLessAndBuild = async (lessPath, cssPath) => {
  const dir = fs.readdirSync(lessPath, { withFileTypes: true });
  for (let i = 0; i < dir.length; i++) {
    const ele = dir[i];
    const _Path = path.join(lessPath, ele.name);
    const _BuildPath = path.join(cssPath, ele.name);
    if (ele.isDirectory()) {
      lessAssetsPath.push(_Path);
      fs.mkdirSync(_BuildPath, { recursive: true });
      await findLessAndBuild(_Path, _BuildPath);
    } else if (ele.isFile()) {
      const cssContent = fs.readFileSync(_Path);
      await buildCss(
        cssContent.toString(),
        _BuildPath.replace(".less", ".css")
      );
      str += `@import '${_Path}';\r\n`;
    }
  }
};
fs.mkdir(buildCssPath, { recursive: true }, async (err) => {
  if (!err) {
    await findLessAndBuild(lessAssetsPath[0], buildCssPath);
    // 打包所有css
    await buildCss(str, path.join(buildCssPath, "index.dist.css"));
  } else {
    console.log(err);
  }
});
