import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import {
  FileTypeDataSourceService,
  FlatTreeNode,
  TreeNode,
} from '../../../../services/search/file-type/file-type-data-source.service';

@Component({
  selector: 'app-file-type-filter-drop-down',
  templateUrl: './file-type-filter-drop-down.component.html',
  styleUrls: ['./file-type-filter-drop-down.component.scss'],
})
export class FileTypeFilterDropDownComponent implements AfterViewInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<FlatTreeNode, TreeNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNode, FlatTreeNode>();
  treeControl: FlatTreeControl<FlatTreeNode>;
  treeFlattener: MatTreeFlattener<TreeNode, FlatTreeNode>;
  dataSource: MatTreeFlatDataSource<TreeNode, FlatTreeNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<FlatTreeNode>(true);

  componentTypeControl = new FormControl<string | undefined>(undefined);
  @Output() fileTypeChange = new EventEmitter<string[]>();

  @Input() set setFileTypes(fileTypes: string[]) {
    this.treeControl.dataNodes.forEach((node) => {
      if (fileTypes.includes(node.item.value!)) {
        this.itemSelectionToggle(node);
      }
    });
    this.populateSelectedItems();
  }

  constructor(private fileTypeData: FileTypeDataSourceService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<FlatTreeNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    fileTypeData.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  getLevel = (node: FlatTreeNode) => node.level;

  isExpandable = (node: FlatTreeNode) => node.expandable;

  getChildren = (node: TreeNode): TreeNode[] | undefined => node.children;

  hasChild = (_: number, _nodeData: FlatTreeNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: FlatTreeNode) => _nodeData.item.value === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item.value === node.item.value ? existingNode : ({} as FlatTreeNode);
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;

    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);

    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: FlatTreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every((child) => this.checklistSelection.isSelected(child));
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FlatTreeNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the item selection. Select/deselect all the descendants node */
  itemSelectionToggle(node: FlatTreeNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf item selection. Check all the parents to see if they changed */
  leafItemSelectionToggle(node: FlatTreeNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: FlatTreeNode): void {
    let parent: FlatTreeNode | null = this.getParentNodeAndChange(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNodeAndChange(parent);
    }
    this.populateSelectedItems();
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: FlatTreeNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every((child) => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node and emit onChange*/
  getParentNodeAndChange(node: FlatTreeNode): FlatTreeNode | null {
    this.onChange();

    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  populateSelectedItems() {
    const selectedItems = this.checklistSelection.selected
      .filter((selectedItem) => selectedItem.item.value !== null)
      .map((selectedItem) => selectedItem.item?.label)
      .join(', ');

    this.componentTypeControl.setValue(selectedItems);
  }

  filterChanged($event: any) {
    const filterText = $event.target.value;
    // FileTypeTreeComponent.filter method which actually filters the tree and gives back a tree structure

    this.fileTypeData.filter(filterText);
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  onChange() {
    this.fileTypeChange.emit(
      this.checklistSelection.selected
        .filter((selectedItem) => selectedItem.item.value)
        .map((selectedItem) => selectedItem.item.value!),
    );
  }

  reset() {
    this.componentTypeControl.reset();
    this.checklistSelection.selected.forEach((selectedItem) => this.checklistSelection.deselect(selectedItem));
    this.onChange();
  }

  ngAfterViewInit(): void {
    this.treeControl.expandAll();
  }

  onBlur() {
    this.populateSelectedItems();
    this.fileTypeData.filter('');
  }
}
