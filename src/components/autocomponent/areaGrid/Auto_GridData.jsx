// utils/fetchGridData.js
import axios from "axios";
 

const Auto_GridData = async ({
  apiUrl,
  searchinfo,
  setGridData,  
}) => {
  try { 
    const url = `${apiUrl}${searchinfo.address}`;
  
    const response = await axios.get(url, { params: searchinfo.params });   

    if (!response?.data) {
      console.error("No server response data."); // 서버 응답 데이터가 없습니다.
      return;
    }
 
    const { jhedher, jbody } = response.data; 
    // 서버 응답 상태 체크
    if (jhedher?.status !== "S") {
      console.warn("The server returned an error response.", jhedher); // 서버에서 오류 응답을 반환했습니다.
      return;
    }  
   setGridData && setGridData(jbody); // 데이터 설정  
  } catch (error) {
    console.error("Data lookup error:", error); // 데이터 조회 오류
  } finally {  
  }
};

export default Auto_GridData;
