import axios from "axios"; 
import { useApiUrl } from "@/context/APIContext";
/**
 * 공통코드 데이터 조회 유틸 함수
 * @param {string} apiUrl - API base URL
 * @param {object} params - 최대 param1 ~ param5까지 전달
 * @returns {Promise<Array>} - 공통코드 결과 배열
 */
 const DropDownItemGetter = async (apiUrl, params = {}) => {
  try { 
    const finalParams = {};
    for (let i = 1; i <= 5; i++) {
      const key = `param${i}`;
      finalParams[key] = params?.[key] ?? "";
    }

    const response = await axios.get(
      `${apiUrl.replace(/\/$/, "")}/com/commondatafetcher`,
      { params: finalParams }
    );

    const { jhedher, jbody } = response.data || {};

    if (jhedher?.status !== "S") { 
      return [];
    }

    return jbody;
  } catch (err) {
    console.error("공통코드 조회 실패:", err);
    return [];
  }
};

export default DropDownItemGetter;