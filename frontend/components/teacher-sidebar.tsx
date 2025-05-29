"use client"

import { FileQuestion, Plus, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface TeacherSidebarProps {
  currentPage: string
  onPageChange: (page: "questions" | "add-question" | "submissions") => void
}

export function TeacherSidebar({ currentPage, onPageChange }: TeacherSidebarProps) {
  const menuItems = [
    {
      title: "Questions",
      icon: FileQuestion,
      key: "questions" as const,
    },
    {
      title: "Add Question",
      icon: Plus,
      key: "add-question" as const,
    },
    {
      title: "Student Submissions",
      icon: Users,
      key: "submissions" as const,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Teacher Portal</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton isActive={currentPage === item.key} onClick={() => onPageChange(item.key)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
