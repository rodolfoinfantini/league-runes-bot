import jsdom from "jsdom"
import fetch from "node-fetch"
import * as canvas from "canvas"
import * as mergeImages from "merge-images"

const { Canvas, Image } = canvas.default
const { default: mergeImgs } = mergeImages

const { JSDOM } = jsdom

export function getChampionRunes(champ, lane) {
    return new Promise(async (resolve, reject) => {
        console.log(`> Generating runes for ${champ} ${lane}`)
        try {
            const imgSize = 32
            const res = await fetch(
                `https://br.op.gg/champions/${champ}/${lane}/runes`
            )
            const data = await res.text()

            const dom = new JSDOM(data.replace(/<style>.+<\/style>/g, ""))

            if (dom.window.document.querySelector(".champion-img") === null)
                return resolve(null)

            const runeBoxSelector = "div.css-173kbtp:nth-child(2)"
            const runeBox = dom.window.document.querySelector(runeBoxSelector)
            const imgs = runeBox.querySelectorAll("img")
            const correctImgs = []
            const defaultX = imgSize / 2
            const runeAmount =
                runeBox.querySelector(".row:nth-child(4)").children.length
            const lastRowRuneAmount =
                runeBox.querySelector(".row:nth-child(7)").children.length
            const secondRuneAmount = runeBox.parentElement.querySelector(
                `${runeBoxSelector} > div:nth-child(4) > .row:nth-child(5)`
            ).children.length
            let yPos = 2
            let xPos = imgSize + defaultX
            let row = 1
            let curImg = 0
            const gap = 15
            imgs.forEach((i) => {
                correctImgs.push({
                    src: i.src.replace(/w_[^,]+/, "w_32"),
                    x: xPos,
                    y: yPos,
                })
                if (row === 1) {
                    yPos += imgSize
                    xPos = runeAmount === 4 ? 0 : defaultX
                    row = 2
                    curImg = 1
                } else if (row === 2) {
                    xPos = curImg * imgSize + (runeAmount === 4 ? 0 : defaultX)
                    curImg++
                    if (curImg === (runeAmount === 4 ? 5 : 4)) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize
                        row = 3
                    }
                } else if (row === 3) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize
                        row = 4
                    }
                } else if (row === 4) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = lastRowRuneAmount === 4 ? 0 : defaultX
                        yPos += imgSize
                        row = 5
                    }
                } else if (row === 5) {
                    xPos =
                        curImg * imgSize +
                        (lastRowRuneAmount === 4 ? 0 : defaultX)
                    curImg++
                    if (curImg === (lastRowRuneAmount === 4 ? 5 : 4)) {
                        curImg = 1
                        xPos = imgSize + defaultX
                        yPos += imgSize + gap
                        row = 6
                    }
                } else if (row === 6) {
                    yPos += imgSize
                    xPos = defaultX
                    row = 7
                    curImg = 1
                } else if (row === 7) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize
                        row = 8
                    }
                } else if (row === 8) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = secondRuneAmount === 3 ? defaultX : 0
                        yPos += imgSize
                        row = 9
                    }
                } else if (row === 9) {
                    xPos =
                        curImg * imgSize +
                        (secondRuneAmount === 3 ? defaultX : 0)
                    curImg++
                    if (curImg === (secondRuneAmount === 3 ? 4 : 5)) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize + gap
                        row = 10
                    }
                } else if (row === 10) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize
                        row = 11
                    }
                } else if (row === 11) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize
                        row = 12
                    }
                } else if (row === 12) {
                    xPos = curImg * imgSize + defaultX
                    curImg++
                    if (curImg === 4) {
                        curImg = 1
                        xPos = defaultX
                        yPos += imgSize
                        row = 13
                    }
                }
            })
            const height = 32 * 12 + gap * 2 + 4
            const b64 = await mergeImgs(correctImgs, {
                Canvas: Canvas,
                Image: Image,
                width: 32 * 4,
                height,
            })
            const buffer = new Buffer.from(b64.split(",")[1], "base64")
            resolve({
                img: buffer,
                pickRate: runeBox.parentElement.parentElement
                    .querySelector("span.css-d86t1k:nth-child(2)")
                    .innerHTML.replace("<!-- -->%", ""),
                winRate: runeBox.parentElement.parentElement
                    .querySelector("td.css-1wvfkid:nth-child(6)")
                    .innerHTML.replace("<!-- -->%", ""),
                imgHeight: height,
                imgWidth: 32 * 4,
            })
        } catch (e) {
            reject(e)
        }
    })
}
