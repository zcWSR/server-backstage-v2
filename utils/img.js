import Images from 'images';
import * as Vibrant from 'node-vibrant';

export default class ImgUtils {
  /**
   * 
   * @param {Buffer} buffer 
   */
  static getDomainColor(buffer, hex = true) {
    return Vibrant.from(buffer).getPalette()
      .then(palette => {
        if (hex) {
          return palette.Vibrant.getHex();
        } else {
          return palette.Vibrant.getRgb();
        }
      })
  }
}