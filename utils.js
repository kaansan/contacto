const getVcardTemplate = (name, number) => {
    const vcard = `
    BEGIN:VCARD
    VERSION:2.1
    N:;${name};;;
    TEL;CELL:${number}
    END:VCARD
    `
    return vcard
}

const createFileName = (FileSystem, fileName) => `${FileSystem.cacheDirectory}${fileName}` 

export {
    getVcardTemplate,
    createFileName
}
