import { Guru } from './guru';
import { ElectionBaseModel } from './electionbasemodel';


export class ElectionModel extends ElectionBaseModel {

  public gurus: Guru[];

  constructor() {
    super();
  }
}
