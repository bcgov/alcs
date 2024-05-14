import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

const TREE_DATA: TreeNode[] = [
  {
    item: { label: 'Pre-ALC', value: null },
    children: [
      { item: { label: 'In Progress', value: 'PROG' } },
      { item: { label: 'Submitted to L/FNG', value: 'SUBG' } },
      {
        item: { label: 'Under Review by L/FNG', value: 'REVG' },
      },
      {
        item: { label: 'Wrong L/FNG', value: 'WRNG' },
      },
      {
        item: { label: 'Returned by L/FNG', value: 'INCM' },
      },
      {
        item: { label: 'L/FNG Refused to Forward', value: 'RFFG' },
      },
      {
        item: { label: 'Returned to L/FNG', value: 'INCG' },
      },
      {
        item: { label: 'Cancelled', value: 'CANC' },
      },
    ],
  },
  {
    item: { label: 'With ALC', value: null },
    children: [
      {
        item: { label: 'Submitted to ALC', value: 'SUBM' },
      },
      {
        item: { label: 'Submitted to ALC - Incomplete', value: 'SUIN' },
      },
      {
        item: { label: 'Received by ALC', value: 'RECA' },
      },
      {
        item: { label: 'Under Review by ALC', value: 'REVA' },
      },
      {
        item: { label: 'Decision Released', value: 'ALCD' },
      },
      {
        item: { label: 'ALC Response Sent (SRW Only)', value: 'ALCR' },
      },
      {
        item: { label: 'Cancelled', value: 'CANC' },
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class PortalStatusDataSourceService {
  dataChange = new BehaviorSubject<TreeNode[]>([]);
  treeData: TreeNode[] = [];

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    this.treeData = TREE_DATA;
    this.dataChange.next(TREE_DATA);
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
}
