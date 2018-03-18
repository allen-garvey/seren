defmodule Seren.Player.Track do
  use Ecto.Schema
  import Ecto.Changeset
  alias Seren.Player.Track


  schema "tracks" do
    field :album_artist, :string
    field :album_disc_count, :integer
    field :album_disc_number, :integer
    field :album_title, :string
    field :album_track_count, :integer
    field :artwork_count, :integer
    field :bit_rate, :integer
    field :date_added, :utc_datetime
    field :date_modified, :utc_datetime
    field :file_path, :string
    field :file_size, :integer
    field :itunes_id, :integer
    field :length, :integer
    field :play_count, :integer
    field :play_date, :utc_datetime
    field :relase_year, :integer
    field :sample_rate, :integer
    field :title, :string
    field :track_number, :integer

    timestamps()

    belongs_to :artist, Seren.Player.Artist
    belongs_to :genre, Seren.Player.Genre
    belongs_to :composer, Seren.Player.Composer
    belongs_to :file_type, Seren.Player.FileType
  end

  @doc false
  def changeset(%Track{} = track, attrs) do
    track
    |> cast(attrs, [:itunes_id, :title, :date_modified, :date_added, :file_size, :file_path, :length, :bit_rate, :sample_rate, :track_number, :relase_year, :album_title, :album_disc_number, :album_disc_count, :album_artist, :album_track_count, :artwork_count, :play_count, :play_date, :artist_id, :genre_id, :composer_id, :file_type_id])
    |> validate_required([:itunes_id, :title, :date_modified, :date_added, :file_size, :file_path, :length, :bit_rate, :sample_rate, :track_number, :relase_year, :album_title, :album_disc_number, :album_disc_count, :album_artist, :album_track_count, :artwork_count, :play_count, :play_date, :artist_id, :file_type_id])
    |> foreign_key_constraint(:artist_id)
    |> assoc_constraint(:artist)
    |> foreign_key_constraint(:genre_id)
    |> assoc_constraint(:genre)
    |> foreign_key_constraint(:composer_id)
    |> assoc_constraint(:composer)
  end
end
