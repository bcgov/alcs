import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ROLES } from '../../authentication/authentication.service';

export interface TreeNodeItem {
  label: string;
  value: string | null;
}
/**
 * Node for to-do item
 */
export interface TreeNode {
  children?: TreeNode[];
  item: TreeNodeItem;
}

/** Flat to-do item node with expandable and level information */
export interface FlatTreeNode {
  item: TreeNodeItem;
  level: number;
  expandable: boolean;
}

const TREE_DATA: TreeNode[] = [
  {
    item: { label: 'Applications', value: null },
    children: [
      { item: { label: 'Exclusion', value: 'EXCL' } },
      { item: { label: 'Inclusion', value: 'INCL' } },
      {
        item: { label: 'Non-Adhering Residential Use', value: 'NARU' },
      },
      {
        item: { label: 'Non-Farm Use', value: 'NFUP' },
      },
      {
        item: { label: 'Placement of Fill', value: 'POFO' },
      },
      {
        item: { label: 'Removal of Soil and Placement of Fill', value: 'PFRS' },
      },
      {
        item: { label: 'Removal of Soil Only', value: 'ROSO' },
      },
      {
        item: { label: 'Subdivision', value: 'SUBD' },
      },
      {
        item: { label: 'Transportation, Utility, Trail Permits', value: 'TURP' },
      },
      {
        item: { label: 'Restrictive Covenant', value: 'COVE' },
      },
    ],
  },
  {
    item: { label: 'Notices of Intent', value: 'NOI' },
  },
  {
    item: { label: 'Planning Reviews', value: 'PLAN' },
    children: [
      {
        item: { label: 'Agricultural Area Plan', value: 'AAPP' },
      },
      {
        item: { label: 'ALR Boundary', value: 'ALRB' },
      },
      {
        item: { label: 'L/FNG Boundary Adjustment', value: 'BAPP' },
      },
      {
        item: { label: 'Crown Land Use Plan', value: 'CLUP' },
      },
      {
        item: { label: 'Misc Studies and Projects', value: 'MISC' },
      },
      {
        item: { label: 'Official Community Plan', value: 'OCPP' },
      },
      {
        item: { label: 'Parks Planning', value: 'PARK' },
      },
      {
        item: { label: 'Regional Growth Strategy', value: 'RGSP' },
      },
      {
        item: { label: 'Transportation Plan', value: 'TPPP' },
      },
      {
        item: { label: 'Utility/Energy Planning', value: 'UEPP' },
      },
      {
        item: { label: 'Zoning Bylaw', value: 'ZBPP' },
      },
    ],
  },
  {
    item: { label: 'Notifications', value: null },
    children: [
      {
        item: { label: 'SRW', value: 'SRW' },
      },
    ],
  },
  {
    item: { label: 'Inquiry', value: null },
    children: [
      {
        item: { label: 'ALR Boundary Definition', value: 'ABDF' },
      },
      {
        item: { label: 'Area of Interest', value: 'AOIN' },
      },
      {
        item: { label: 'General Correspondence', value: 'GENC' },
      },
      {
        item: { label: 'Inquiry for Investigation', value: 'INVN' },
      },
      {
        item: { label: 'Parcel Under 2 Acres', value: 'P2AC' },
      },
      {
        item: { label: 'Referral', value: 'REFR' },
      },
      {
        item: { label: 'Subdivision by Approving Officer', value: 'SAOF' },
      },
    ],
  },
];

const COMMISSIONER_TREE_DATA: TreeNode[] = [
  {
    item: { label: 'Applications', value: null },
    children: [
      { item: { label: 'Exclusion', value: 'EXCL' } },
      { item: { label: 'Inclusion', value: 'INCL' } },
      {
        item: { label: 'Non-Adhering Residential Use', value: 'NARU' },
      },
      {
        item: { label: 'Non-Farm Use', value: 'NFUP' },
      },
      {
        item: { label: 'Placement of Fill', value: 'POFO' },
      },
      {
        item: { label: 'Removal of Soil and Placement of Fill', value: 'PFRS' },
      },
      {
        item: { label: 'Removal of Soil Only', value: 'ROSO' },
      },
      {
        item: { label: 'Subdivision', value: 'SUBD' },
      },
      {
        item: { label: 'Transportation, Utility, Trail Permits', value: 'TURP' },
      },
      {
        item: { label: 'Restrictive Covenant', value: 'COVE' },
      },
    ],
  },
];

const COMMISSIONER_LIST_DATA = ['EXCL', 'INCL', 'NARU', 'NFUP', 'POFO', 'PFRS', 'ROSO', 'SUBD', 'TURP', 'COVE'];

@Injectable({ providedIn: 'root' })
export class FileTypeDataSourceService {
  dataChange = new BehaviorSubject<TreeNode[]>([]);
  treeData: TreeNode[] = [];
  isCommissioner = false;

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  constructor(public authService: AuthenticationService) {
    this.authService.$currentUser.subscribe((currentUser) => {
      if (currentUser) {
        this.isCommissioner =
          currentUser.client_roles && currentUser.client_roles.length === 1
            ? currentUser.client_roles.includes(ROLES.COMMISSIONER)
            : false;
      }
    });

    this.initialize();
  }

  initialize() {
    this.treeData = this.isCommissioner ? COMMISSIONER_TREE_DATA : TREE_DATA;
    this.isCommissioner ? this.dataChange.next(COMMISSIONER_TREE_DATA) : this.dataChange.next(TREE_DATA);
  }

  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      // Filter the tree
      const filter = (array: TreeNode[], text: string) => {
        const getChildren = (result: any, object: any) => {
          if (object.item.label.toLowerCase().includes(text.toLowerCase())) {
            result.push(object);
            return result;
          }
          if (Array.isArray(object.children)) {
            const children = object.children.reduce(getChildren, []);
            if (children.length) result.push({ ...object, children });
          }
          return result;
        };

        return array.reduce(getChildren, []);
      };

      filteredTreeData = filter(this.treeData, filterText);
    } else {
      // Return the initial tree
      filteredTreeData = this.treeData;
    }
    this.dataChange.next(filteredTreeData);
  }

  public getCommissionerListData() {
    return COMMISSIONER_LIST_DATA;
  }
}
