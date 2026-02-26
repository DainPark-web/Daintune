import { useInput } from "ink"
import type { Dispatch, SetStateAction } from "react"
import { Page } from "../types";


interface Props {
  selected: number
  setSelected: Dispatch<SetStateAction<number>>
  items: { label: string; icon: string; page: Page | null }[]
  onNavigate: (page: Page) => void
  exit: () => void
}

const defaultInput = ({ selected, setSelected, items, onNavigate, exit }: Props) => { 
  useInput((input, key) => {
    if (key.upArrow)   setSelected((prev: number) => (prev - 1 + items.length) % items.length)
    if (key.downArrow) setSelected((prev: number) => (prev + 1) % items.length)
    if (key.return) {
      const item = items[selected]
      if (item.page) onNavigate(item.page)
      else exit()
    }
    if (input.toLowerCase() === 'q') exit()
  })
}

export default defaultInput