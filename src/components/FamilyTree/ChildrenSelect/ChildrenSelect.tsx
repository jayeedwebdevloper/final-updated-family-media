import React from 'react';

type ChildrenSelectProps = {
    index: number;
    value: string;
    onChange: (index: number, value: string) => void;
    onRemove: (index: number) => void;
};

const ChildrenSelect: React.FC<ChildrenSelectProps> = ({ index, value, onChange, onRemove }) => {
    return (
        <div className="flex items-center gap-2 mb-2">
            <input
                name={`child-${index}`}
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                className='w-full py-2 px-3 outline-none rounded-md ring-1 text-sm'
                type='text'
            />
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700"
            >
                ⨉
            </button>
        </div>
    );
};

export default ChildrenSelect;
