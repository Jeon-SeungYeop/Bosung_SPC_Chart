
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState(null);

  // // 백엔드에서 데이터 가져오기
  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get('http://211.117.200.179:8800/');
  //     setData(response.data);
  //   } catch (error) {
  //     console.error("데이터를 가져오는 도중 오류 발생", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  // return (
  //   <div>
  //     <h1>Spring Boot Backend Data</h1>
  //     <div>
  //       {data ? (
  //         <pre>{JSON.stringify(data, null, 2)}</pre>
  //       ) : (
  //         <p>로딩 중...</p>
  //       )}
  //     </div>
  //   </div>
  // );
};

export default App;
