'use client'

import React, { HTMLProps, use, useEffect, useState } from "react";
import FileUploadCard from "@/components/photo-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RecordModel } from "pocketbase";
import { set, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UpdateUser, UpdateUserPassword } from "@/serveractions/auth";

const EditableProfileImage = ({loggedIn, avatarImage, avatarName}: {loggedIn: boolean, avatarImage: string, avatarName: string}) => {

  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const uploadHandler = () => {
    console.log("Upload handler called");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger className='group w-1/4 relative overflow-hidden rounded-full cursor-pointer'>
      <Avatar className="w-full aspect-square h-auto">
        <AvatarImage src={avatarImage} />
        <AvatarFallback className='text-6xl'>{avatarName[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className='absolute w-full bottom-0 p-2 flex justify-center bg-black bg-opacity-25 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out'>
        <span>Edit image</span>
      </div>
    </DialogTrigger>  
    <DialogContent>
      <DialogTitle className="text-center text-2xl font-bold">Edit Profile Image</DialogTitle>
      <FileUploadCard uploadHandler={uploadHandler} />
    </DialogContent>
    </Dialog>
  )
}

function UpdateUserInfoForm({ user, ...props }: { user: RecordModel } & HTMLProps<HTMLDivElement>) {

  const router = useRouter();
  const [formSendAvailable, setFormSendAvailable] = useState(false);
  
  const formSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      const res = await UpdateUser(data.email, data.name);
      form.reset();
      if (res.success) {
        console.log("User updated successfully");
      }
      router.refresh();
    }
  };

  // Check if the form is dirty (changed)
  useEffect(() => {
    setFormSendAvailable(form.formState.isDirty && form.formState.isValid);
  }, [form.formState]);

  return (
    <div {...props}>
      <Card className="w-full h-full flex flex-col justify-center items-center">
        <CardHeader>
          <CardTitle>Update Your Info</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col space-y-4 w-full">
              <FormField 
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="string" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} type="string" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!formSendAvailable}>Update</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function ChangePasswordForm({ user, ...props }: { user: RecordModel } & HTMLProps<HTMLDivElement>) {

  const router = useRouter();
  const [formSendAvailable, setFormSendAvailable] = useState(false);

  const formSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z.string().min(8, "Password confirmation must be at least 8 characters long"),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"], // This will highlight the passwordConfirm field
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const isValid = await form.trigger();
    if (isValid) {
      const res = await UpdateUserPassword(data.password, data.passwordConfirm);
      form.reset();
      if (res.success) {
        console.log("Password updated successfully");
      }
      router.refresh();
    }
  };

  // Check if the form is dirty (changed)
  useEffect(() => {
    setFormSendAvailable(form.formState.isDirty && form.formState.isValid);
  }, [form.formState]);

  return (
    <div {...props}>
      <Card className="w-full h-full flex flex-col justify-center items-center">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col space-y-4 w-full">
              <FormField 
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!formSendAvailable}>Update</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export { EditableProfileImage, UpdateUserInfoForm, ChangePasswordForm }