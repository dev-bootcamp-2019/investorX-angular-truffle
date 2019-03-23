import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../util/web3.service';
import { ContractDeploymentService } from '../../util/contract-deployment.service';

@Component({
  selector: 'app-testnet-error',
  templateUrl: './testnet-error.component.html',
  styleUrls: ['./testnet-error.component.css']
})
export class TestnetErrorComponent implements OnInit {

  constructor(private web3Service: Web3Service, private contractService: ContractDeploymentService) { }
  ngOnInit() {
  }
  checkDeployedOnNetwork(id: number) {
    const networks = this.contractService.deployedNetworks;
    if (id === 1) { return networks.includes('main'); }
    if (id === 42) { return networks.includes('kovan'); }
    if (id === 3) { return networks.includes('ropsten'); }
    if (id === 4) { return networks.includes('rinkeby'); }
  }
  compareDeployedNetwork() {
    return this.contractService.deployedNetworks.includes(this.web3Service.network);
  }
}
