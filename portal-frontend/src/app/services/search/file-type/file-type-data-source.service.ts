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

/** Flat to-do item node with expandable and level information */
export interface FlatTreeNode {
  item: TreeNodeItem;
  level: number;
  expandable: boolean;
}

const TREE_DATA: TreeNode[] = [
  {
    item: { label: 'Application', value: null },
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
    item: { label: 'Notice of Intent', value: 'NOI' },
  },
  {
    item: { label: 'Notifications', value: null },

    children: [
      {
        item: { label: 'SRW', value: 'SRW' },
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class FileTypeDataSourceService {
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
