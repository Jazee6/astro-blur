import fs from "fs"
import path from "path"
import dayjs from "dayjs";

function getDate() {
    const today = dayjs()
    return today.format("YYYY-MM-DD")
}

const args = process.argv.slice(2)

if (args.length === 0) {
    console.error(`Error: No filename argument provided
Usage: pnpm new <filename>`)
    process.exit(1)
}

let fileName = args[0]

const fileExtensionRegex = /\.(md|mdx)$/i
if (!fileExtensionRegex.test(fileName)) {
    fileName += ".md"
}

const targetDir = "./src/content/posts/"
const fullPath = path.join(targetDir, fileName)

if (fs.existsSync(fullPath)) {
    console.error(`Error：File ${fullPath} already exists `)
    process.exit(1)
}

const content = `---
title: ${args[0]}
description: ${args[0]}
pubDate: ${getDate()}
---
`

fs.writeFileSync(path.join(targetDir, fileName), content)

console.log(`Post ${fullPath} created`)
