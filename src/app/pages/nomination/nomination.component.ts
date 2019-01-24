import { Component, OnInit } from '@angular/core';
import { ElectionService } from '../../util/election.service';
import { Web3Service } from '../../util/web3.service';

@Component({
  selector: 'app-nomination',
  templateUrl: './nomination.component.html',
  styleUrls: ['./nomination.component.css']
})
export class NominationComponent implements OnInit {

  name: string;
  wallet: string;

  constructor(public web3Service: Web3Service,
    public electionService: ElectionService) { }

  ngOnInit() {

  }

  nominateGuru() {
    if (this.electionService.isCurrentUserTheElectionChairperson === true) {
      this.electionService.addGuru(this.name, this.wallet);
    } else {
      this.electionService.beGuru(this.name);
    }
  }

}
