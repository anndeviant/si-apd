"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

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
          Informasi tentang APD wajib yang harus digunakan sesuai dengan standar
          keselamatan kerja.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Placeholder content */}
        <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Mandatory APD
          </h3>
          <p className="text-gray-600">
            Fitur ini sedang dalam pengembangan. Akan berisi informasi tentang
            APD wajib yang harus digunakan.
          </p>
        </div>
      </CardContent>
    </>
  );
}
