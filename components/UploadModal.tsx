import useUploadModal from "@/hooks/useUploadModal";
import Modal from "./Modal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import uniqid from "uniqid";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset
  } = useForm<FieldValues>({
    defaultValues: {
      author: '',
      title: '',
      song: null,
      image: null,
    }
  });

  const handleCloseModal = () => {
    reset();
    uploadModal.onClose();
  };

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0]
      const songFile = values.song?.[0]

      if (!imageFile || !songFile || !user) {
        toast.error('Faltan campos!');
        return;
      }

      const uniqueID = uniqid()

      // Sube una canción
      const {
        data: songData,
        error: songError,
      } = await supabaseClient
        .storage
        .from('songs')
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (songError) {
        setIsLoading(false);
        return toast.error('Fallo al subir la canción');
      }

      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient
        .storage
        .from('images')
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (imageError) {
        setIsLoading(false);
        return toast.error('Failed image upload');
      }

      const {
        error: supabaseError
      } = await supabaseClient
        .from('songs')
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path
        });

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success('Canción subida!');
      reset();
      handleCloseModal();

    } catch (error) {
      toast.error("Algo ha salido mal.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title="Agrega una Canción"
      description="Sube un archivo mp3"
      isOpen={uploadModal.isOpen}
      onClose={handleCloseModal}
      onChange={() => { }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Titulo de la canción"
        />
        <Input
          id="author"
          disabled={isLoading}
          {...register('author', { required: true })}
          placeholder="Autor de la canción"
        />
        <div>
          <div className="pb-1">
            Selecciona un archivo
          </div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register('song', { required: true })}
          />
        </div>
        <div>
          <div className="pb-1">
            Selecciona una imagen
          </div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register('image', { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Subir Canción
        </Button>
      </form>
    </Modal>
  );
}

export default UploadModal;
