"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, UserPlus, Users } from "lucide-react";
import MandatoryApdForm from "./mandatory-apd-form";
import PegawaiDataTable from "./pegawai-data-table";

interface BeritaSerahMandatoryProps {
  userId: string;
}

export default function BeritaSerahMandatory({}: BeritaSerahMandatoryProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Mandatory APD</span>
        </CardTitle>
        <CardDescription>
          Kelola data pegawai dan APD wajib yang harus digunakan sesuai dengan
          standar keselamatan kerja.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Form</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Lihat Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Tambah Data Pegawai Mandatory APD
              </h3>
              <MandatoryApdForm />
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="border rounded-lg p-6">
              <PegawaiDataTable />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
