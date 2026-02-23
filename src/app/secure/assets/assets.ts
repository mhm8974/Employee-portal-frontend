import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Asset {
    id: string;
    name: string;
    type: string;
    serialNumber: string;
    assignedDate: string;
    status: 'In Use' | 'Under Repair' | 'Returned';
    specs: string;
}

@Component({
    selector: 'app-assets',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './assets.html',
    styleUrls: ['./assets.css']
})
export class AssetsComponent {
    myAssets: Asset[] = [
        {
            id: 'AST-001',
            name: 'MacBook Pro 14"',
            type: 'Laptop',
            serialNumber: 'C02FX1J9MD6M',
            assignedDate: 'Jan 15, 2025',
            status: 'In Use',
            specs: 'M3 Pro, 16GB RAM, 512GB SSD'
        },
        {
            id: 'AST-042',
            name: 'Dell 27" Monitor',
            type: 'Display',
            serialNumber: 'CN-0XY123-74445',
            assignedDate: 'Jan 16, 2025',
            status: 'In Use',
            specs: '4K UHD, USB-C Hub'
        }
    ];

    showReportModal = false;
    selectedAssetId = '';
    issueDescription = '';

    toggleReportModal(assetId: string = ''): void {
        this.selectedAssetId = assetId;
        this.showReportModal = !this.showReportModal;
        if (!this.showReportModal) this.issueDescription = '';
    }

    submitReport(): void {
        if (!this.issueDescription) {
            alert('Please describe the issue');
            return;
        }

        console.log('[Mock Backend] Asset issue reported:', {
            assetId: this.selectedAssetId,
            description: this.issueDescription,
            timestamp: new Date().toISOString()
        });

        alert('Report submitted successfully. IT support will contact you shortly.');
        this.toggleReportModal();
    }
}
