import React from "react";

// 그리드 ROW 선택 체크박스
const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, setDeleteCheckItems, primarykey, gridColumns,gridData, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    const handleSingleCheck = (e) => {
      const checked = e.target.checked;
      const rowElement = e.target.closest("tr");
      if (!rowElement) return;
    
      // 해당 행의 primarykey 값 추출
      const keyValues = primarykey.reduce((acc, key) => {
        acc[key] = rowElement.dataset[key];   
        return acc;
      }, {});
    
      // gridData에서 해당 행을 찾기
      const rowData = gridData.find(row =>
        primarykey.every(key => String(row[key]) === String(keyValues[key]))
      );
    
      if (!rowData) return;
      
      // 체크/해제에 따라 setDeleteCheckItems에 추가/제거
      setDeleteCheckItems((prev) => {
        if (checked) {
          // 이미 존재하는지 확인하고 없으면 추가
          const exists = prev.some(item =>
            primarykey.every(key => item[key] === rowData[key])
          );
          return exists ? prev : [...prev, rowData];
        } else {
          // 체크 해제 시 제거
          return prev.filter(item =>
            !primarykey.every(key => item[key] === rowData[key])
          );
        }
      });
    };
    
    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <div className="w-[70px] " > 
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          className="table-checkbox "
          onClick={handleSingleCheck}
        />
      </div>
    );
  }
);

export default IndeterminateCheckbox;
