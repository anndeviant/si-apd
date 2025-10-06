"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, UserPlus, Users } from "lucide-react";
import PegawaiHelmTable from "./pegawai-helm-table";
import PegawaiShoesTable from "./pegawai-shoes-table";
import PegawaiKatelpackTable from "./pegawai-katelpack-table";

interface BeritaSerahMandatoryProps {
  userId: string;
}

export default function BeritaSerahMandatory({}: BeritaSerahMandatoryProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Form Serah Terima APD</span>
        </CardTitle>
        <CardDescription>
          Kelola form dan data serah terima APD untuk distribusi kepada pegawai.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="helm" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="helm" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Helm</span>
            </TabsTrigger>
            <TabsTrigger
              value="safety-shoes"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Safety Shoes</span>
            </TabsTrigger>
            <TabsTrigger
              value="katelpack"
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Katelpack</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="helm" className="space-y-4">
            <PegawaiHelmTable />
          </TabsContent>

          <TabsContent value="safety-shoes" className="space-y-4">
            <PegawaiShoesTable />
          </TabsContent>

          <TabsContent value="katelpack" className="space-y-4">
            <PegawaiKatelpackTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
