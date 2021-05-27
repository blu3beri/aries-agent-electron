export class Base64 {
  public async fromFile(file: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }
}
