Having implemented the step in [spec1.md](./spec1.md) now add the following:
Support for CI/CD using GitHub Actions the same way as in the [library-data-loader](./../library-data-loader/spec/spec1.md) subpackage.
Equally, create the similar wrangler.toml.template file for the library-app subpackage for and incorporate it into the CI/CD pipeline for the library-app subpackage; in this case the worker will not need a queue, nor upload bucket yet.
Do not use a shared drizzle migrations_dir = "../library-data-layer/drizzle" directory, but create a new one for this subpackage as was done for the [library-data-loader](./../library-data-loader) subpackage.

