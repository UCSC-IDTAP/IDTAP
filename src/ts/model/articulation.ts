import { ArtNameType, StrokeNicknameType } from '@shared/types';


class Articulation {
  name: ArtNameType;
  stroke: string | undefined;
  hindi: string | undefined;
  ipa: string | undefined;
  engTrans: string | undefined;
  strokeNickname: StrokeNicknameType | undefined;

  // pluck, hammer-off, hammer-on, slide, pluck, dampen
  constructor({
    name = 'pluck',
    stroke = undefined,
    hindi = undefined,
    ipa = undefined,
    engTrans = undefined,
    strokeNickname = undefined,
  }: {
    name?: ArtNameType,
    stroke?: string,
    hindi?: string,
    ipa?: string,
    engTrans?: string,
    strokeNickname?: StrokeNicknameType
  } = {}) {
    this.name = name
    if (stroke !== undefined) this.stroke = stroke;
    if (hindi !== undefined) this.hindi = hindi;
    if (ipa !== undefined) this.ipa = ipa;
    if (engTrans !== undefined) this.engTrans = engTrans;
    if (strokeNickname !== undefined) this.strokeNickname = strokeNickname;
    if (this.stroke === 'd' && this.strokeNickname === undefined) {
      this.strokeNickname = 'da'
    } else if (this.stroke === 'r' && this.strokeNickname === undefined) {
      this.strokeNickname = 'ra'
    }
  }
}

export { Articulation };
