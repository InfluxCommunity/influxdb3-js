// automatically generated by the FlatBuffers compiler, do not modify

import { SparseMatrixIndexCSX } from '../../../../org/apache/arrow/flatbuf/sparse-matrix-index-csx';
import { SparseTensorIndexCOO } from '../../../../org/apache/arrow/flatbuf/sparse-tensor-index-coo';
import { SparseTensorIndexCSF } from '../../../../org/apache/arrow/flatbuf/sparse-tensor-index-csf';


export enum SparseTensorIndex {
  NONE = 0,
  SparseTensorIndexCOO = 1,
  SparseMatrixIndexCSX = 2,
  SparseTensorIndexCSF = 3
}

export function unionToSparseTensorIndex(
  type: SparseTensorIndex,
  accessor: (obj:SparseMatrixIndexCSX|SparseTensorIndexCOO|SparseTensorIndexCSF) => SparseMatrixIndexCSX|SparseTensorIndexCOO|SparseTensorIndexCSF|null
): SparseMatrixIndexCSX|SparseTensorIndexCOO|SparseTensorIndexCSF|null {
  switch(SparseTensorIndex[type]) {
    case 'NONE': return null; 
    case 'SparseTensorIndexCOO': return accessor(new SparseTensorIndexCOO())! as SparseTensorIndexCOO;
    case 'SparseMatrixIndexCSX': return accessor(new SparseMatrixIndexCSX())! as SparseMatrixIndexCSX;
    case 'SparseTensorIndexCSF': return accessor(new SparseTensorIndexCSF())! as SparseTensorIndexCSF;
    default: return null;
  }
}

export function unionListToSparseTensorIndex(
  type: SparseTensorIndex, 
  accessor: (index: number, obj:SparseMatrixIndexCSX|SparseTensorIndexCOO|SparseTensorIndexCSF) => SparseMatrixIndexCSX|SparseTensorIndexCOO|SparseTensorIndexCSF|null, 
  index: number
): SparseMatrixIndexCSX|SparseTensorIndexCOO|SparseTensorIndexCSF|null {
  switch(SparseTensorIndex[type]) {
    case 'NONE': return null; 
    case 'SparseTensorIndexCOO': return accessor(index, new SparseTensorIndexCOO())! as SparseTensorIndexCOO;
    case 'SparseMatrixIndexCSX': return accessor(index, new SparseMatrixIndexCSX())! as SparseMatrixIndexCSX;
    case 'SparseTensorIndexCSF': return accessor(index, new SparseTensorIndexCSF())! as SparseTensorIndexCSF;
    default: return null;
  }
}