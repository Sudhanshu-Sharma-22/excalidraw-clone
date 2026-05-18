import { ReactNode } from "react";

interface iconInterface {
    icon: string,
    onClick: () => void,
    color: string,
    activated: boolean
}

export function IconsButton(params: iconInterface) {
    return <div className={`cursor-pointer p-2 text-white rounded-md ${params.activated ? "bg-gray-500" : params.color}`} onClick={params.onClick}>
        {params.icon}
    </div>
}