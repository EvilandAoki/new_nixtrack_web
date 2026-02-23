import * as XLSX from 'xlsx'

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Hoja1') => {
  try {
    // Generar libro y hoja
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Escribir en un ArrayBuffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const dataBlob = new Blob([excelBuffer], { type: EXCEL_TYPE })

    const timestamp = new Date().toISOString().split('T')[0]
    const fullFilename = `${filename}_${timestamp}.xlsx`

    // Crear un enlace de descarga manual (Vanilla JS) para asegurar la compatibilidad con el nombre
    const url = window.URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fullFilename)
    document.body.appendChild(link)
    link.click()

    // Limpiar el DOM
    if (link.parentNode) {
      link.parentNode.removeChild(link)
    }
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw error
  }
}

export const printTable = (data: any[], title: string) => {
  try {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión')
    }

    const headers = Object.keys(data[0] || {})

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1890ff; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data
        .map(
          (row) => `
                <tr>
                  ${headers.map((header) => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
              `
        )
        .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  } catch (error) {
    console.error('Error printing table:', error)
    throw error
  }
}
