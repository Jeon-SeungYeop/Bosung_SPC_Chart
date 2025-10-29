import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Textinput from "@/components/ui/Textinput";
import Checkbox from "@/components/ui/Checkbox";


const AddModal = ({ activeModal, onclose }) => {
    const groups = [
        {
            value: 10,
            label: "System"
        },
        {
            value: 20,
            label: "Admin"
        },
        {
            value: 30,
            label: "생산"
        },
        {
            value: 40,
            label: "Guest"
        },
    ];

    const categories = [
        {
            value: "M",
            label: "주"
        },
        {
            value: "P",
            label: "상세"
        },
    ];

  const [value, setValue] = useState("A");

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <Modal
      activeModal={activeModal}
      onClose={onclose}
      title="메뉴 추가"
      labelClass="btn-outline-dark"
      themeClass="bg-slate-900 dark:bg-slate-800 dark:border-b dark:border-slate-700"
      centered
    >
      <form className="space-y-4">
        <Select
          label="사용자 그룹"
          options={groups}
          onChange={handleChange}
          value={value}
          horizontal
          placeholder="사용자 그룹을 선택하세요."
        />
        <Select
          label="메뉴 구분"
          options={categories}
          onChange={handleChange}
          value={value}
          horizontal
          placeholder="구분을 선택하세요."
        />
        <div className="fromGroup flex gap-2">
            <div className="block capitalize form-label  flex-0 mr-6 md:w-[100px] w-[60px] break-words">
                갱신권한 여부
            </div>
            <Checkbox
                type="checkbox"
                value={value}
                defaultChecked
                onChange={handleChange}
            />
        </div>
        <Select
          label="메뉴 선택"
          options={groups}
          onChange={handleChange}
          value={value}
          horizontal
          placeholder="메뉴를 선택하세요."
        />
        <div className="col-span-12 flex justify-end">
          <button
            type="submit"
            className="btn btn-dark h-min w-max text-sm font-normal "
          >
            저장
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddModal;
