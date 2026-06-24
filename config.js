// Edit ONLY this username, then (optionally) re-run make_qr_codes.py.
const GITHUB_USERNAME = "YD18425";
const BASE_URL = `https://${GITHUB_USERNAME}.github.io/calc2-viz`;

const VIZ_URLS = {
  "ex01-sqrtx-about-x": `${BASE_URL}/ex01-sqrtx-about-x.html`,
  "ex02a-quarterx2-about-y": `${BASE_URL}/ex02a-quarterx2-about-y.html`,
  "ex02b-quarterx2-about-x": `${BASE_URL}/ex02b-quarterx2-about-x.html`,
  "ex03a-sqrtx-x2-about-x": `${BASE_URL}/ex03a-sqrtx-x2-about-x.html`,
  "ex03b-sqrtx-x2-about-y": `${BASE_URL}/ex03b-sqrtx-x2-about-y.html`,
  "ex04a-cbrtx-xover4-about-y": `${BASE_URL}/ex04a-cbrtx-xover4-about-y.html`,
  "ex04b-cbrtx-xover4-about-x": `${BASE_URL}/ex04b-cbrtx-xover4-about-x.html`,
  "ex05-4mx2-about-y": `${BASE_URL}/ex05-4mx2-about-y.html`,
  "extra01-area-xplus2": `${BASE_URL}/extra01-area-xplus2.html`,
  "extra02-xplus1sq-about-x": `${BASE_URL}/extra02-xplus1sq-about-x.html`,
  "extra03-2mx-about-x": `${BASE_URL}/extra03-2mx-about-x.html`,
  "extra04-x2-4mx2-about-x": `${BASE_URL}/extra04-x2-4mx2-about-x.html`,
  "extra05-sqrtx-y2-about-y": `${BASE_URL}/extra05-sqrtx-y2-about-y.html`,
  "extra06-x2-xeqy2-about-y": `${BASE_URL}/extra06-x2-xeqy2-about-y.html`,
  "extra07-ex-about-y": `${BASE_URL}/extra07-ex-about-y.html`,
  "extra08-secx-about-x": `${BASE_URL}/extra08-secx-about-x.html`,
  "extra09-sqrt-rational-about-x": `${BASE_URL}/extra09-sqrt-rational-about-x.html`,
  "extra10-x2-y4-about-y": `${BASE_URL}/extra10-x2-y4-about-y.html`,
  "extra11a-lines-about-x": `${BASE_URL}/extra11a-lines-about-x.html`,
  "extra11b-lines-about-y": `${BASE_URL}/extra11b-lines-about-y.html`,
  "method-disks-about-x": `${BASE_URL}/method-disks-about-x.html`,
  "method-disks-about-y": `${BASE_URL}/method-disks-about-y.html`,
  "method-washers-about-x": `${BASE_URL}/method-washers-about-x.html`,
  "method-washers-about-y": `${BASE_URL}/method-washers-about-y.html`,
};

if (typeof module !== 'undefined') module.exports = { GITHUB_USERNAME, BASE_URL, VIZ_URLS };
