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
    ],
  },
  {
    item: { label: 'Notice of Intent', value: 'NOI' },
  },
  {
    item: { label: 'Non-Application', value: null },

    children: [
      {
        item: { label: 'Covenants', value: 'COV' },
      },
      {
        item: { label: 'Notification of SRW', value: 'SRW' },
      },
      {
        item: { label: 'Planning Review', value: 'PLAN' },
      },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class FileTypeDataSourceService {
  dataChange = new BehaviorSubject<TreeNode[]>([]);
  treeData: any[] = [];

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    this.treeData = TREE_DATA;
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const data = TREE_DATA;

    // Notify the change.
    this.dataChange.next(data);
  }

  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      // Filter the tree
      function filter(array: any[], text: string) {
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
      }

      filteredTreeData = filter(this.treeData, filterText);
    } else {
      // Return the initial tree
      filteredTreeData = this.treeData;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    const data = filteredTreeData;
    // Notify the change.
    this.dataChange.next(data);
  }
}
