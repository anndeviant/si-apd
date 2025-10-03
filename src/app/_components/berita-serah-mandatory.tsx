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
              <h3 className="text-lg font-semibold mb-4">
                Data Pegawai Mandatory APD
              </h3>
              {/* Placeholder untuk tab Lihat Data */}
              <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Lihat Data Pegawai
                </h4>
                <p className="text-gray-600">
                  Fitur ini akan segera tersedia untuk melihat dan mengelola
                  data pegawai.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
