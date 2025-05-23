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
    item: { label: 'Approved', value: 'APPR' },
  },
  {
    item: { label: 'Refused', value: 'REFU' },
  },
  {
    item: { label: 'Ordered not to Proceed (NOI)', value: 'ONTP' },
  },
];

const COMMISSIONER_TREE_DATA: TreeNode[] = [
  {
    item: { label: 'Approved', value: 'APPR' },
  },
  {
    item: { label: 'Refused', value: 'REFU' },
  },
];

const COMMISSIONER_LIST_DATA = ['APPR', 'REFU'];

@Injectable({ providedIn: 'root' })
export class DecisionOutcomeDataSourceService {
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
