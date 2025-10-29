import axios from "axios";
import { availablePaths } from "@/context/_data";
import { toast } from "react-toastify";


/**
 *  CommonFunction
 * - AG Grid와 관련된 공통 유틸리티 함수들을 모아 놓은 클래스
 * - 기본 설정, 이벤트 핸들링, 데이터 변환, API 연동까지 포함
 */
class CommonFunction {
  /**
   *   AG Grid의 기본 컬럼 설정 반환
   * - flex: 1 로 모든 컬럼이 동일한 비율로 너비 분배
   */
  static getDefaultColDef() {
    return { flex: 1 };
  }

  /**
   *   AG Grid의 행 선택 방식 설정 반환
   * - 여러 행 선택(multiRow) 방식
   */
  static getRowSelection() {
    return { mode: "multiRow" };
  }

  /**
   *   드롭다운 데이터를 { value: label } 형태의 객체로 변환
   * @param {Array} data - [{ value, label }, ...] 형태의 배열
   * @returns {Object} - { value1: label1, value2: label2, ... }
   */
  static convertData(data) {
    const result = {};
    data.forEach((item) => {
      result[item.value] = item.label;
    });
    return result;
  }

  /**
   *   매핑 객체에서 특정 label을 가진 key 찾기
   * @param {Object} mappings - { value: label } 형태의 객체
   * @param {string} name - 찾고자 하는 label
   * @returns {string} 해당 label에 대응되는 key
   */
  static lookupKey(mappings, name) {
    const keys = Object.keys(mappings);
    for (let i = 0; i < keys.length; i++) {
      if (mappings[keys[i]] === name) return keys[i];
    }
    return "";
  }

  /**
   *   셀 값 변경 핸들러
   * - 드롭다운 값 매핑
   * - 원본 데이터와 비교해 변경 시 rowstatus = "U" 설정
   * @param {Object} params - onCellValueChanged 이벤트의 파라미터
   * @param {Array} primaryKeys - 복합키로 사용할 필드 목록
   * @param {Object} originalDataRef - 원본 데이터를 담은 ref 객체
   * @param {Object} dropdownData - 드롭다운 매핑 데이터
   */
  static handleCellValueChanged(params, primaryKeys, originalDataRef, dropdownData) {
    const { node, colDef, newValue } = params;
    const rowData = node.data;
    const field = colDef.field;

    // 드롭다운 필드 매핑 정의
    const createMappingRules = (dropdownData) => {
      const rules = {};
      Object.keys(dropdownData).forEach(key => {
        rules[key] = key;
      });
      return rules;
    };

    const mappingRules = createMappingRules(dropdownData);
    const targetField = mappingRules[field];

    // 드롭다운 매핑 값 업데이트
    if (targetField && dropdownData[targetField]) {
      const matchedValue = CommonFunction.lookupKey(dropdownData[targetField].mappings, newValue);
      if (matchedValue) {
        node.setDataValue(targetField, matchedValue);
      }
    }

    // 신규 행일 경우 rowstatus 업데이트 안 함
    if (rowData.rowstatus === "C" || rowData.rowstatus === "P") return;

    // 복합키 기반 원본 행 찾기
    const compositeKey = primaryKeys.map(key => rowData[key]).join('_');
    const originalRow = originalDataRef.current.get(compositeKey) || {};
    const originalVal = originalRow[field] ?? "";
    const newVal = newValue ?? "";

    // 값이 변경되면 rowstatus = "U", 아니면 초기화
    if (newVal !== originalVal) {
      node.setDataValue("rowstatus", "U");
    } else {
      node.setDataValue("rowstatus", "");
    }
  }

  /**
   *   특정 행이 포커스되었을 때 스타일 적용
   * @param {Object} params - { node, focusedRowIndex, isDark }
   * @returns {Object|null} 스타일 객체
   */
  static getRowStyle(params) {
    const { node, focusedRowIndex, isDark } = params;
    if (focusedRowIndex !== null && node.rowIndex === focusedRowIndex) {
      return { backgroundColor: isDark ? '#6f7788' : '#eef7fe' };
    }
    return null;
  }

  /**
   *   셀 포커스 시 포커스된 행 인덱스를 상태로 설정
   * @param {Object} params - onCellFocused 이벤트 파라미터
   * @param {Function} setFocusedRowIndex - 인덱스를 설정하는 setState 함수
   */
  static onCellFocused(params, setFocusedRowIndex) {
    if (params.rowIndex != null) {
      setFocusedRowIndex(params.rowIndex);
    }
  }

  /**
   *   셀 데이터 변경 핸들러 반환 (커링 형태)
   * @param {Array} primaryKeys - 복합키 필드
   * @param {Object} originalDataRef - 원본 데이터 Ref
   * @param {Object} dropdownData - 드롭다운 매핑 데이터
   * @returns {Function} onCellValueChanged 핸들러
   */
  static onCellValueChanged(primaryKeys, originalDataRef, dropdownData) {
    return (params) => {
      CommonFunction.handleCellValueChanged(params, primaryKeys, originalDataRef, dropdownData);
    };
  }

  /**
   *   검색 조건 업데이트 함수 반환
   * @param {Function} setSearchParams - setState 함수
   * @returns {Function} 키-값 쌍을 받아 조건 업데이트
   */
  static createUpdateSearchParams(setSearchParams) {
    return (key, value) => {
      setSearchParams(prev => ({
        ...prev,
        [key]: value,
      }));
    };
  }

  /**
   * 공통 API 조회 후 그리드 데이터 세팅
   * - 원본 데이터 ref 구성
   * - useflag 처리
   * @param {Object} param
   * @param {string} param.apiUrl - API 기본 URL
   * @param {Object} param.searchinfo - 요청 주소 및 파라미터
   * @param {Function} param.setGridData - 상태 업데이트 함수
   * @param {Function} param.setAddData - 상태 업데이트 함수
   * @param {Object} param.originalDataRef - 원본 데이터 저장용 Ref
   * @param {Array} param.primaryKeys - 복합키 필드 목록
   * @param {Boolean} param.isreturnJson- jsonData 반환 여부 
   */
  static async fetchAndSetGridData({ apiUrl, searchinfo, setGridData, originalDataRef, primaryKeys, isreturnJson = false, setAddData = null }) {
    try {
      if (!searchinfo.address) {
        console.error("API address is not set.");
        return;
      }

      const accessToken = localStorage.getItem("token")
      const url = `${apiUrl}${searchinfo.address}`;
      const response = await axios.get(
        url,
        { 
          params: searchinfo.params,
          headers: { Authorization: `Bearer ${accessToken}` }
        },
      )
      .catch(err => {
        if (err.response?.status === 403) {
          toast.error("조회 권한이 없습니다.");
        } else {
          console.error("다른 에러 발생", err);
        }
      });

      if (!response?.data) {
        console.error("No server response data.");
        return;
      }

      const { jhedher, jbody } = response.data;

      if (jhedher?.status !== "S") {
        console.warn("The server returned an error response.", jhedher);
        return;
      }

      // JSON Array로 받을 시 (monitor/Realtime.jsx와 같이 한번의 조회로 다수의 SP 결과물을 받을 때 // Backend의 controller/monitor/Realtime.java 참조)
      if (jhedher?.db_msg === "JsonArray") {
        setGridData(jbody);
        return;
      }
      // useflag 문자열 → boolean 변환 + rowstatus 초기화
      const transformedData = jbody.map(item => {
        const transformedItem = {
          ...item,
          rowstatus: ""
        };

        return transformedItem;
      });

      // 원본 데이터 복사
      if (originalDataRef && primaryKeys && Array.isArray(primaryKeys)) {
        originalDataRef.current = CommonFunction.setoriginalDataRef(transformedData, primaryKeys);
      }
      if (setGridData) {
        setGridData(transformedData);
      }
      if (setAddData) {
        setAddData([]); // 삭제 리스트 가 있을 경우 초기화
      }
      return isreturnJson ? jbody : undefined; // json 을 직접 return 하는 경우 . 

    } catch (error) {
      console.error("Data lookup error:", error);
    }
  }

  /**
   *   복합키를 기반으로 원본 데이터 맵 구성
   * @param {Array} gridData - 전체 행 배열
   * @param {Array} primaryKeys - 키 배열
   * @returns {Map} 복합키 기반 Map 객체
   */
  static setoriginalDataRef(gridData, primaryKeys) {
    const map = new Map();
    if (Array.isArray(gridData)) {
      gridData.forEach(row => {
        const compositeKey = primaryKeys.map(key => row[key]).join('_');
        map.set(compositeKey, { ...row });
      });
    }
    return map;
  }

  /**
   * 공통 API 조회 후 Image_Box의 img src 세팅
   * - 원본 데이터 ref 구성
   * - useflag 처리
   * @param {Object} param
   * @param {string} param.apiUrl - API 기본 URL
   * @param {Object} param.searchinfo - 요청 주소 및 파라미터
   * @param {Function} param.setGridData - 상태 업데이트 함수
   * @param {Boolean} param.isreturnJson- jsonData 반환 여부 
   */
  static async fetchAndSetImgSrc({
    apiUrl,
    searchinfo,  // 이미지 접근 data information
    setImgSrc,   // 이미지 stats
  }) { 
    try {
      if (!searchinfo.address) {
        console.error("API address is not set.");
        return;
      }
      const url = `${apiUrl}${searchinfo.address}`;

      // GET 요청 + 파일/이미지 수신
      const response = await axios.get(url, {
        params: searchinfo.params,
        responseType: "blob",
      });



      // 응답 확인 및 파일 데이터 가 없을경우 

      // 응답 확인 및 파일 데이터 가 없을경우 
      if (!response) { 
        setImgSrc(null);
        return;
      }


      // 응답 확인 및 파일 데이터 가 없을경우 
      if (!response.data) { 
        setImgSrc(null);
        return;
      }

      if (response.data.size === 0) { 
        setImgSrc(null);
        return;
      }

      // Blob -> Object URL 변환
      const blob = new Blob([response.data]);
      const objectUrl = URL.createObjectURL(blob);

      setImgSrc(objectUrl);

    } catch (error) {
      console.error("File/image fetch error:", error);
    }
  }

  /**
   * 화면 별 갱신 권한 반환하기 ( 저장 , 삭제, 저장, 엑셀 업록드 , 엑셀 내려받기 버튼 에 적용 ) 
   */

  static getMenuPerAuth() {
    // 매뉴 클릭 시 저장 해둔 화면 명 가지고 오기 
    const currentPath = localStorage.getItem("menupath");
    const path = JSON.parse(localStorage.getItem("path"));
    // 매뉴 리스트 중 현재 화면 명과 일치하는 매뉴의 권한 수집하기 
    if (currentPath) {
      const matched = path.find(item => item.path === currentPath);
 
      if (matched) {
        return [
          matched.modifymanageauth,
          matched.exceluploadauth,
          matched.exceldownloadauth,
        ];
      }
    }

    // 매칭된 메뉴가 없거나 currentPath가 없는 경우 기본 권한 반환
    return ["N", "N", "N"];
  }

  /**
  ** Auto_Popup_CodeName으로 값을 grid에 셋팅
  * @param {Object} param.popupInfoRef - 팝업 호출 후 받아올 데이터 useRef
  * @param {Function} param.setIsPopupOpen - 팝업 오픈 여부
  * @param {Object} param.gridRef - 포커스된 node를 찾기위한 ref
  * @param {Integear} param.selectedRowIndexRef - 선택된 행의 index
  * @param {Map} param.fieldMappings - rownode의 컬럼구분을 위한 변수
  */
 static setCodeName(popupInfoRef, setIsPopupOpen, gridRef, selectedRowIndexRef, fieldMappings,){
    return () => {
      const popupData = popupInfoRef.current;
      if (!popupData.code || popupData.code === "") {
        setIsPopupOpen(false);
        return;
      }
      setIsPopupOpen(false);
      const idx = selectedRowIndexRef.current;
      const rowNode = gridRef.current.api.getDisplayedRowAtIndex(idx).data;
      // 필드 매핑을 기반으로 데이터 업데이트
      Object.entries(fieldMappings).forEach(([gridField, popupField]) => {
        rowNode[gridField] = popupData[popupField];
      });

      // 행 상태 업데이트
      if (rowNode.rowstatus === "C") {
        rowNode.rowstatus = "C"
      } else if (rowNode.rowstatus === "P") {
        rowNode.rowstatus = "P"
      } else {
        rowNode.rowstatus = "U"
      }
      gridRef.current.api.applyTransaction({ update: [rowNode] });
    };
 };
}

export default CommonFunction;
