const getVcardTemplate = (name, number) =>`
BEGIN:VCARD
VERSION:2.1
N:;${name};;;
TEL;CELL:${number}
END:VCARD
`
const createFileName = (FileSystem, fileName) => `${FileSystem.documentDirectory}${fileName}`

export {
    getVcardTemplate,
    createFileName,
}
