//common
import type { FileMeta } from '../../types.js';

export default class FileData {
  public data: Buffer|string;
  public name: string;
  public type: string;

  constructor(file: FileMeta) {
    this.data = file.data;
    this.name = file.name;
    this.type = file.type;
  }
}