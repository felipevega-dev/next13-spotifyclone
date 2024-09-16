"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Song } from "@/types";
import MediaItem from "./MediaItem";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-hot-toast";
import uniqid from "uniqid";
import useUploadModal from "@/hooks/useUploadModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UploadedSongs = () => {
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const uploadModal = useUploadModal();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchSongs = async () => {
      const { data, error } = await supabaseClient
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSongs(data as Song[]);
      }
    };

    fetchSongs();
  }, [supabaseClient, user?.id]);

  const handleDelete = async (id: string) => {
    if (confirm("Esta seguro que desea eliminar esta cancion?")) {
      setIsLoading(true);
      const { error } = await supabaseClient
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(error.message);
      } else {
        setSongs(songs.filter((song) => song.id !== id));
        toast.success('Canion eliminada correctamente');
      }
      setIsLoading(false);
    }
  };

  const handleEdit = async (song: Song) => {
    const newTitle = prompt("Ingresa nuevo titulo", song.title);
    if (newTitle) {
      setIsLoading(true);
      const { error } = await supabaseClient
        .from('songs')
        .update({ title: newTitle })
        .eq('id', song.id);

      if (error) {
        toast.error(error.message);
      } else {
        setSongs(songs.map(s => s.id === song.id ? { ...s, title: newTitle } : s));
        toast.success('Canion actualizada correctamente');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-2 w-full p-6">
      <h1 className="text-white text-2xl font-semibold">Tu lista de canciones subidas</h1>
      {songs.map((song) => (
        <div key={song.id} className="flex items-center gap-x-4 w-full">
          <div className="flex-1">
            <MediaItem onClick={() => {}} data={song} />
          </div>
          <AiOutlineEdit
            onClick={() => handleEdit(song)}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            size={24}
          />
          <AiOutlineDelete
            onClick={() => handleDelete(song.id)}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            size={24}
          />
        </div>
      ))}
    </div>
  );
};

export default UploadedSongs;