const { Pool } = require("pg");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async add({ title, year, genre, performer, number = null, albumId = null }) {
    const id = "song-" + nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5, &6, &7, &8, &9) RETURNING id",
      values: [
        id,
        title,
        year,
        genre,
        performer,
        number,
        albumId,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Data gagal ditambahkan");
    }

    return result.rows[0].id;
  }
}

module.exports = SongsService;

